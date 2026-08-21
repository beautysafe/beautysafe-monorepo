import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateUserVipDto {
  @ApiProperty({
    example: true,
    description: "Enable or disable VIP status for the user",
  })
  @IsBoolean()
  vip: boolean;
}