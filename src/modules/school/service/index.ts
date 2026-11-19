import { DeleteResult, In } from "typeorm";
import dataSource from "../../../database/config/ormconfig";
import { School } from "../entity/school.entity";
import crypto from "crypto";
import config from "../../../config";
import { Region } from "../../region/entity/region.entity";
import { RegionService } from "../../region/service";

const algorithm = "aes-256-ecb";

// AES-256 requires a 32-byte key: it is derived from JWT_SECRET with SHA-256,
// so any secret format (e.g. `openssl rand -hex 32`) can be used.
const getKey = () => crypto.createHash("sha256").update(config.secret).digest();

type SchoolBatchResponse = {
  successCount: number;
  failItems: string[][];
};

// The EMIS number (SECOPE number in the DRC) is optional and unique:
// an empty value is stored as null so that several schools can have none.
const emisOrNull = (emis_number?: string | null) =>
  emis_number?.trim() ? emis_number.trim() : null;

export class SchoolService {
  static create = async (data: School): Promise<School> => {
    const schoolRepository = await dataSource.getRepository(School);

    return schoolRepository.save({
      ...data,
      emis_number: emisOrNull(data.emis_number) as string,
    });
  };

  // Rows: EMIS (SECOPE) number, name, then the region path (in the DRC: province,
  // PROVED, sous-PROVED). The admin sends the rows without the CSV header.
  // A school already known by its EMIS number, or by its name in the same region, is updated.
  static createInBatch = async (batch: string[][]): Promise<any> => {
    const schoolRepository = await dataSource.getRepository(School);
    const data = batch.filter((row) => row.some((cell) => cell?.trim()));

    const response = await data.reduce(
      async (
        acc: Promise<SchoolBatchResponse>,
        row: Array<string>
      ): Promise<SchoolBatchResponse> => {
        const oldState = await acc;
        const [emis, schoolName, ...regionPath] = row.map((cell) =>
          (cell || "").trim()
        );
        const emis_number = emisOrNull(emis);
        const name = schoolName.replace(/\s+/g, " ");

        const region = name
          ? await RegionService.findOrCreateLeafRegionByNamePath(
              regionPath.filter(Boolean)
            )
          : undefined;

        if (!region?.id) {
          return { ...oldState, failItems: [...oldState.failItems, row] };
        }

        try {
          const existing = await schoolRepository.findOne({
            where: emis_number
              ? { emis_number }
              : { name, region_id: region.id },
          });
          await schoolRepository.save({
            ...existing,
            emis_number: (emis_number ?? existing?.emis_number) as string,
            name,
            region_id: region.id,
          });
        } catch {
          return { ...oldState, failItems: [...oldState.failItems, row] };
        }

        return { ...oldState, successCount: oldState.successCount + 1 };
      },
      Promise.resolve({
        successCount: 0,
        failItems: [],
      })
    );

    return response;
  };

  static update = async (
    id: string,
    { name, emis_number, region_id }: School
  ): Promise<School> => {
    const schoolRepository = await dataSource.getRepository(School);

    return schoolRepository.save({
      id,
      region_id,
      emis_number: emisOrNull(emis_number) as string,
      name,
    });
  };

  static delete = async (id: string): Promise<DeleteResult> => {
    const schoolRepository = await dataSource.getRepository(School);

    return schoolRepository.delete(id);
  };

  static findByRegionId = async (id: Region["id"]): Promise<School[]> => {
    const schoolRepository = await dataSource.getRepository(School);

    return schoolRepository.find({
      where: { region: { id } },
      order: { name: "ASC" },
      relations: {
        region: {
          parent: { parent: { parent: { parent: { parent: true } } } },
        },
      },
    });
  };

  static findByID = async (id: string): Promise<School | null> => {
    const schoolRepository = await dataSource.getRepository(School);

    return schoolRepository.findOne({
      where: { id },
      relations: {
        region: {
          parent: { parent: { parent: { parent: { parent: true } } } },
        },
      },
    });
  };

  static findAll = async (regionIds?: string[]): Promise<School[]> => {
    const schoolRepository = await dataSource.getRepository(School);
    // The region and its parents name the place of the school in the administration
    const relations = { region: { parent: { parent: true } } };
    if (!regionIds) {
      return schoolRepository.find({ relations, order: { name: "ASC" } });
    }

    return schoolRepository.find({
      where: {
        region_id: In(regionIds),
      },
      relations,
      order: { name: "ASC" },
    });
  };

  static encryptId = (id: string): string => {
    const cipher = crypto.createCipheriv(
      algorithm,
      getKey(),
      null
    );
    let encrypted = cipher.update(id, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  };

  static decryptId = (key: string): string => {
    const decipher = crypto.createDecipheriv(
      algorithm,
      getKey(),
      null
    );
    let decrypted = decipher.update(key, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };
}
