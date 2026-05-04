import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccessProject, isAdmin } from './access';
import { Membership } from '@/db/models';

vi.mock('@/db/mongoose', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/db/models', () => ({
  Membership: {
    findOne: vi.fn(),
  },
}));

describe('Access Layer (Authorization Rules)', () => {
  const userId = 'user-123';
  const projectId = 'project-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('canAccessProject', () => {
    it('should return true if membership exists', async () => {
      vi.mocked(Membership.findOne).mockResolvedValue({ userId, projectId });
      const result = await canAccessProject(userId, projectId);
      expect(result).toBe(true);
    });

    it('should return false if membership does not exist', async () => {
      vi.mocked(Membership.findOne).mockResolvedValue(null);
      const result = await canAccessProject(userId, projectId);
      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true if user is an admin', async () => {
      vi.mocked(Membership.findOne).mockResolvedValue({ userId, projectId, role: 'admin' });
      const result = await isAdmin(userId, projectId);
      expect(result).toBe(true);
    });

    it('should return false if user is not an admin', async () => {
      vi.mocked(Membership.findOne).mockResolvedValue(null);
      const result = await isAdmin(userId, projectId);
      expect(result).toBe(false);
    });
  });
});
