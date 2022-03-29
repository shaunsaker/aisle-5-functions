import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/v1/https';
import {
  CallResponse,
  ShoppingList,
  ShoppingListId,
  UserId,
} from '../../models';
import { firebase } from '../../services/firebase';
import { firebaseFetchActiveShoppingList } from '../../services/firebase/firebaseFetchActiveShoppingList';
import { firebaseFetchUserData } from '../../services/firebase/firebaseFetchUserData';
import { firebaseUpdateShoppingList } from '../../services/firebase/firebaseUpdateShoppingList';
import { objectToArray } from '../../utils/objectToArray';

interface Data {
  shoppingListId: ShoppingListId;
}

export const createShoppingListMembers = async ({
  data,
  context,
}: {
  data: Data;
  context: any;
}): Promise<CallResponse> => {
  // when we create a shopping list in the mobile app
  // we attach the user's uid to the members array
  // but we don't know the uids of the user's (settings) members
  // hence we do this on the backend using their email addresses
  const { uid } = context.auth;

  if (!uid) {
    return {
      error: true,
      message: 'User is not authenticated.',
    };
  }

  const { shoppingListId } = data;

  if (!shoppingListId) {
    return {
      error: true,
      message: 'Please provide a shoppingListId.',
    };
  }

  // get the user member emails
  const userData = await firebaseFetchUserData(uid);

  if (!userData) {
    return {
      error: true,
      message: 'Could not find user data.',
    };
  }

  const userMemberEmails = objectToArray(userData.members).map(
    (member) => member.email,
  );

  // get the user member uids from the emails
  const userMemberUids: UserId[] = [];

  for (const email of userMemberEmails) {
    const userRecord = await firebase.auth().getUserByEmail(email);
    const userMemberUid = userRecord.uid;

    userMemberUids.push(userMemberUid);
  }

  // get the user's active shopping list
  const shoppingList = await firebaseFetchActiveShoppingList(uid);

  // save the user member uids to the shopping list
  const newShoppingList: ShoppingList = {
    ...shoppingList,
    members: [uid, ...userMemberUids],
  };

  await firebaseUpdateShoppingList({
    shoppingListId: newShoppingList.id,
    shoppingList: newShoppingList,
  });

  return {
    success: true,
  };
};

export const onCreateShoppingListMembers = functions.https.onCall(
  async (data: Data, context: CallableContext) =>
    createShoppingListMembers({
      data,
      context,
    }),
);
