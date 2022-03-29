import { firebase } from '.';
import { UserId, UserProfileData } from '../../models';

type FirebaseFetchUsersResponse = Record<UserId, UserProfileData>;

export const firebaseFetchUsers =
  async (): Promise<FirebaseFetchUsersResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const users: FirebaseFetchUsersResponse = {};

        (await firebase.firestore().collection('users').get()).docs.forEach(
          (doc) => {
            users[doc.id] = doc.data() as UserProfileData;
          },
        );

        resolve(users);
      } catch (error) {
        reject(error);
      }
    });
  };
