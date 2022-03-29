import { firebase } from '.';
import { UserId, UserProfileData } from '../../models';

export const firebaseFetchUserData = async (
  uid: UserId,
): Promise<UserProfileData> => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = (
        await firebase.firestore().collection('users').doc(uid).get()
      ).data() as UserProfileData;

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};
