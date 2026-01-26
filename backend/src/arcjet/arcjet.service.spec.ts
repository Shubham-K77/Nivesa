import { Test, TestingModule } from '@nestjs/testing';
import { ArcjetService } from './arcjet.service';

describe('ArcjetService', () => {
  let service: ArcjetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArcjetService],
    }).compile();

    service = module.get<ArcjetService>(ArcjetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
