export class CreateStoreDto {
  timeOpen: string;
  timeClose: string;
  barberId: string;
}

export class UpdateStoreDto {
  timeOpen?: string;
  timeClose?: string;
  barberId?: string;
}
