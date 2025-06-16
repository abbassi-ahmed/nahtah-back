export class CreateStoreDto {
  timeOpen: string;
  timeClose: string;
}

export class UpdateStoreDto {
  timeOpen?: string;
  timeClose?: string;
}
