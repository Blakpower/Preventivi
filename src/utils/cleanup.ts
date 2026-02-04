import { supabase } from '../db';
import { subDays } from 'date-fns';

export async function cleanupOldTrash(userId: number) {
  if (!userId) return;

  try {
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    
    // Delete quotes that are in trash (deletedAt is not null) 
    // AND were deleted more than 30 days ago
    // AND belong to the current user (for safety/RLS)
    const { error, count } = await supabase
      .from('quotes')
      .delete({ count: 'exact' })
      .eq('ownerUserId', userId)
      .not('deletedAt', 'is', null)
      .lt('deletedAt', thirtyDaysAgo);

    if (error) {
      console.error('Error cleaning up trash:', error);
    } else if (count && count > 0) {
      console.log(`Cleanup: Permanently deleted ${count} old quotes from trash.`);
    }
  } catch (err) {
    console.error('Unexpected error during trash cleanup:', err);
  }
}
