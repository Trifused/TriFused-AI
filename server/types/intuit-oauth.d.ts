declare module 'intuit-oauth' {
  interface OAuthClientConfig {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
    redirectUri: string;
    logging?: boolean;
  }

  interface AuthorizeOptions {
    scope: string[];
    state?: string;
  }

  interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
    id_token?: string;
  }

  interface TokenData {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
  }

  class OAuthClient {
    static scopes: {
      Accounting: string;
      Payment: string;
      Payroll: string;
      TimeTracking: string;
      OpenId: string;
      Profile: string;
      Email: string;
      Phone: string;
      Address: string;
    };

    constructor(config: OAuthClientConfig);
    
    authorizeUri(options: AuthorizeOptions): string;
    createToken(url: string): Promise<{ getJson(): TokenResponse }>;
    refresh(): Promise<{ getJson(): TokenResponse }>;
    revoke(params?: { access_token?: string; refresh_token?: string }): Promise<void>;
    setToken(token: TokenData): void;
    getToken(): TokenData;
    isAccessTokenValid(): boolean;
  }

  export default OAuthClient;
}
