import { SetMetadata } from '@nestjs/common';

export const LANDLORD_ONLY_KEY = 'landlord_only';
export const LandlordOnly = () => SetMetadata(LANDLORD_ONLY_KEY, true);
