import { messaging } from 'firebase-admin';
import { firebase } from '.';

const firebaseSendNotification = async ({
  title,
  body,
  token,
}: {
  title: string;
  body: string;
  token: string;
}): Promise<void> => {
  const message: messaging.Message = {
    notification: {
      title,
      body,
    },
    token,
  };

  console.log('Sending notification...');

  try {
    const response = await firebase.messaging().send(message);

    console.log(`Successfully sent notification: ${response}`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
};

export { firebaseSendNotification };
