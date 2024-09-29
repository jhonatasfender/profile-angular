export interface IUserModel {
  readonly uid: string;
  readonly name: string;
  readonly profile: string;
  readonly email: string;
}

export interface IUserWithPasswordModel extends IUserModel {
  readonly password: string;
}

export interface IUserWithoutUIDModel extends Omit<IUserModel, 'uid'> {}
