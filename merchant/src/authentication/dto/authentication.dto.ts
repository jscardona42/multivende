export class CreateAuthenticationDto {
    name: String;
    token: String;
    expires_at?: Date;
    refresh_token?: String;
    merchant_id?: String;
}
