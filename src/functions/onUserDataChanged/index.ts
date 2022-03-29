import * as functions from 'firebase-functions';
import { ShoppingList, UserId, UserProfileData } from '../../models';
import { firebase } from '../../services/firebase';
import { firebaseFetchShoppingLists } from '../../services/firebase/firebaseFetchShoppingLists';
import { firebaseUpdateShoppingList } from '../../services/firebase/firebaseUpdateShoppingList';
import { objectToArray } from '../../utils/objectToArray';

// TODO: SS test this
export const onUserDataChanged = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    // if a member was added to/removed from the members array
    // then we should add/remove them from the user's shopping lists
    const previousValue = change.before.data() as UserProfileData;
    const previousMemberEmails = objectToArray(previousValue.members).map(
      (memberData) => memberData.email,
    );
    const newValue = change.after.data() as UserProfileData;
    const newMemberEmails = objectToArray(newValue.members).map(
      (memberData) => memberData.email,
    );

    const removedMemberEmails: string[] = [];

    previousMemberEmails.forEach((email) => {
      if (!newMemberEmails.includes(email)) {
        // the member was removed
        removedMemberEmails.push(email);
      }
    });

    const addedMemberEmails: string[] = [];

    newMemberEmails.forEach((email) => {
      if (!previousMemberEmails.includes(email)) {
        // the member was added
        addedMemberEmails.push(email);
      }
    });

    if (!removedMemberEmails.length && !addedMemberEmails.length) {
      // if members were not changed then return
      console.log('MEMBERS DID NOT CHANGE');
      return;
    }

    // fetch the user's shopping lists
    const uid = context.params.userId;

    if (!uid) {
      // should not be possible
      console.log('NO UID');
      return;
    }

    const shoppingLists = objectToArray(await firebaseFetchShoppingLists(uid));
    const hasShoppingLists = Object.keys(shoppingLists.length);

    if (!hasShoppingLists) {
      console.log('NO SHOPPING LISTS');
      return;
    }

    // get the user member uids from the emails
    // FIXME: this is shared in onCreateShoppingListMembers and can be extracted
    const userMemberUids: UserId[] = [];

    for (const email of newMemberEmails) {
      const userRecord = await firebase.auth().getUserByEmail(email);
      const userMemberUid = userRecord.uid;

      userMemberUids.push(userMemberUid);
    }

    // for each shopping list
    // FIXME: this is shared in onCreateShoppingListMembers and can be extracted
    for (const shoppingList of shoppingLists) {
      const newMembers = [uid, ...userMemberUids];

      // update the shopping list with the new members
      // save the user member uids to the shopping list
      const newShoppingList: ShoppingList = {
        ...shoppingList,
        members: newMembers,
      };

      await firebaseUpdateShoppingList({
        shoppingListId: newShoppingList.id,
        shoppingList: newShoppingList,
      });
    }
  });
