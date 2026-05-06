import { doc, getDoc, updateDoc, serverTimestamp, setDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export interface Score {
    id: string;
    wpm: number;
    accuracy: number;
    mode: string;
    createdAt: any;
}

export const saveRaceStats = async (wpm: number, accuracy: number, mode: 'practice' | 'race') => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // 1. Save individual score
        await addDoc(collection(db, 'scores'), {
            userId: user.uid,
            wpm,
            accuracy,
            mode,
            createdAt: serverTimestamp()
        });

        // 2. Update user profile records
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            const updates: any = {
                gamesPlayed: (data.gamesPlayed || 0) + 1,
                updatedAt: serverTimestamp()
            };
            
            // Increment total time typing (assuming average test is 15-30 seconds if not specified)
            // Just a rough estimate for the 'timeTyping' stat
            updates.timeTyping = (data.timeTyping || 0) + 0.5; // adding 30 seconds per game

            // Just required for rules
            updates.displayName = data.displayName || user.displayName || "Anonymous";
            updates.createdAt = data.createdAt;

            if (wpm > (data.wpmRecord || 0)) {
                updates.wpmRecord = wpm;
            } else {
                updates.wpmRecord = data.wpmRecord || 0;
            }

            await updateDoc(userRef, updates);
        }
    } catch (error) {
        console.error("Error saving stats", error);
    }
};

export const getUserHistory = async (userId: string, l: number = 50): Promise<Score[]> => {
    try {
        const scoresRef = collection(db, 'scores');
        const q = query(
            scoresRef, 
            where('userId', '==', userId), 
            orderBy('createdAt', 'desc'),
            limit(l)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Score[];
    } catch (error) {
        console.error("Error fetching history", error);
        return [];
    }
};
