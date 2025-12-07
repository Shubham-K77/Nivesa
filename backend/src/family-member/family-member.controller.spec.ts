import { Test, TestingModule } from '@nestjs/testing';
import { FamilyMemberController } from './family-member.controller';

describe('FamilyMemberController', () => {
  let controller: FamilyMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamilyMemberController],
    }).compile();

    controller = module.get<FamilyMemberController>(FamilyMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
