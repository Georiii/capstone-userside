import { storage, db, auth } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const uploadImageAsync = async (uri: string, userId: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const imageRef = ref(storage, `wardrobe/${userId}/${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);
  return await getDownloadURL(imageRef);
};

export const saveClothingItem = async ({
  imageUrl,
  clothName,
  description,
  wardrobe,
  categories,
  occasions,
}: {
  imageUrl: string;
  clothName: string;
  description: string;
  wardrobe: string[];
  categories: string[];
  occasions: string[];
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not logged in');
  const userDoc = doc(db, 'users', user.uid);
  await updateDoc(userDoc, {
    wardrobe: arrayUnion({
      imageUrl,
      clothName,
      description,
      wardrobe,
      categories,
      occasions,
      createdAt: new Date(),
    }),
  });
}; 