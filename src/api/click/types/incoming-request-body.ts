import { ConfirmActionDto } from '../dto/confirm-action.dto';
import { PrepareActionDto } from '../dto/prepare-action.dto';

export type ClickRequestBody = ConfirmActionDto | PrepareActionDto;
