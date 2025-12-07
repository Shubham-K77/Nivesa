import { FamilyMemberDto } from './familyMember.create.dto';
import { PartialType } from '@nestjs/mapped-types';

export class FamilyMemberUpdateDto extends PartialType(FamilyMemberDto) {}
