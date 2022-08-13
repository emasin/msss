import { Injectable, Logger } from '@nestjs/common';
/**
 * Profile Service
 */
@Injectable()
export class KftcService {
  private readonly logger = new Logger(KftcService.name);
  /**
   * Constructor
   * @param {Repository<Roles>} rolesRepository
   */
  async callback(): Promise<number> {
    return 0;
  }
}
