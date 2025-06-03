export class CreateStoreDto {
  timeOpen: string;
  timeClose: string;
  userId: string;
}

export class UpdateStoreDto {
  timeOpen?: string;
  timeClose?: string;
  userId?: string;
}
