import CognitoIdentityServiceProvider, {
  AdminGetUserRequest,
  InitiateAuthRequest,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { AuthInfo, UserProfile } from "../../../types/UserTypes";

export async function getUserData(
  cognito: CognitoIdentityServiceProvider,
  userPoolId: string,
  username: string
): Promise<UserProfile> {
  const params: AdminGetUserRequest = {
    UserPoolId: userPoolId,
    Username: username,
  };

  const result = await cognito.adminGetUser(params).promise();
  const user = <UserProfile>{
    username: result.Username,
    email: result.UserAttributes.filter((attribute) => {
      return attribute.Name == "email";
    })[0].Value,
    status: result.UserStatus,
    enabled: result.Enabled,
    attributes: result.UserAttributes,
    createdAt: result.UserCreateDate,
    modifiedAt: result.UserLastModifiedDate,
  };

  return user;
}

export async function initiateAuth(
  cognito: CognitoIdentityServiceProvider,
  params: InitiateAuthRequest
): Promise<AuthInfo> {
  const response = await cognito.initiateAuth(params).promise();

  return {
    expiresIn: response.AuthenticationResult?.ExpiresIn,
    type: response.AuthenticationResult.TokenType,
    accessToken: response.AuthenticationResult?.IdToken,
    refreshToken: response.AuthenticationResult?.RefreshToken,
  };
}
