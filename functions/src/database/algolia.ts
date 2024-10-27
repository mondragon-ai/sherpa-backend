import * as functions from "firebase-functions";

// Algolia
import algoliasearch from "algoliasearch";
import {EmailDocument} from "../lib/types/emails";

const algolia = algoliasearch(
  process.env.X_ALGOLGIA_APPLICATION_ID as string,
  process.env.X_ALGOLGIA_API_KEY as string,
);

type AlgoliaIndexTypes = "inventory_index" | "items_index";

/**
 * Update Algolia index with the provided object for a given collection.
 * @param index - The Algolia index to update.
 * @param update_object - The object to update in the index.
 * @param collection - The name of the collection that the object belongs to.
 */
export const updateToAlgolia = async (
  index: AlgoliaIndexTypes,
  update_object: EmailDocument,
) => {
  if (!update_object) return;

  const algolia_db = algolia.initIndex(index);

  try {
    const push_data: {objectID: string}[] = [];

    push_data.push({...update_object, objectID: update_object.id});

    if (push_data.length > 0) {
      await algolia_db.saveObjects(push_data);
    }
  } catch (e) {
    const error_message =
      " 🚨 [ERROR]: Likely a problem uploading/syncing primary db with Algolia. Check logs";
    functions.logger.error(error_message);
  }

  return;
};

/**
 * Deletes an object from an Algolia index.
 *
 * @param index - The name of the Algolia index to delete from.
 * @param objectID - The ID of the object to delete.
 */
export const deleteFromAlgolia = async (
  index: AlgoliaIndexTypes,
  objectID: string,
) => {
  const instance_algolia = algolia.initIndex(index);

  if (!instance_algolia) return;

  try {
    functions.logger.debug(" => Data ready to delete from algolia");
    await instance_algolia.deleteObject(objectID);
  } catch (e) {
    const text =
      " 🚨 [ERROR]: Likely a problem uploading / syncing primary db with angolia. Check logs";
    functions.logger.error(text);
  }
};
