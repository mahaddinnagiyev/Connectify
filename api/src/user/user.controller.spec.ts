import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';
import { ExecutionContext } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  const mockUserService = {
    gel_all_users: jest.fn(),
    get_user_by_id: jest.fn(),
    get_user_by_username: jest.fn(),
    edit_user_informations: jest.fn(),
    get_block_list: jest.fn(),
    get_blocker_list: jest.fn(),
    block_user: jest.fn(),
    unblock_user: jest.fn(),
  };

  const mockRequest = (user = { id: '1', username: 'test' }, query = {}) => {
    return { user, query } as any;
  };

  const mockGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();
    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('get_all_users', () => {
    it('should return all users', async () => {
      const result = { success: true, users: [] };
      mockUserService.gel_all_users.mockResolvedValue(result);
      const res = await controller.get_all_users();
      expect(res).toEqual(result);
      expect(service.gel_all_users).toHaveBeenCalled();
    });
  });

  describe('get_user_by_id', () => {
    it('should return user by username if query.username exists', async () => {
      const result = { success: true };
      mockUserService.get_user_by_username.mockResolvedValue(result);
      const req = mockRequest(
        { id: '1', username: 'test' },
        { username: 'test' },
      );
      const res = await controller.get_user_by_id(req);
      expect(res).toEqual(result);
      expect(service.get_user_by_username).toHaveBeenCalledWith('test');
    });

    it('should return user by id if query.id exists', async () => {
      const result = { success: true };
      mockUserService.get_user_by_id.mockResolvedValue(result);
      const req = mockRequest({ id: '1', username: 'test' }, { id: '1' });
      const res = await controller.get_user_by_id(req);
      expect(res).toEqual(result);
      expect(service.get_user_by_id).toHaveBeenCalledWith('1');
    });

    it('should return user by req.user if no query exists', async () => {
      const result = { success: true };
      mockUserService.get_user_by_id.mockResolvedValue(result);
      const req = mockRequest({ id: '1', username: 'test' }, {});
      const res = await controller.get_user_by_id(req);
      expect(res).toEqual(result);
      expect(service.get_user_by_id).toHaveBeenCalledWith('1');
    });
  });

  describe('edit_user_info', () => {
    it('should edit user info', async () => {
      const dto = { username: 'newname' };
      const req = mockRequest({ id: '1', username: 'test' });
      const result = {
        success: true,
        message: 'Informations edited successfully',
      };
      mockUserService.edit_user_informations.mockResolvedValue(result);
      const res = await controller.edit_user_info(dto, req);
      expect(res).toEqual(result);
      expect(service.edit_user_informations).toHaveBeenCalledWith(
        dto,
        req.user,
      );
    });
  });

  describe('get_block_list', () => {
    it('should return blocker list if query.by exists', async () => {
      const result = { success: true, blockerList: [] };
      mockUserService.get_blocker_list.mockResolvedValue(result);
      const req = mockRequest({ id: '1', username: 'test' }, { by: 'true' });
      const res = await controller.get_block_list(req, 'true');
      expect(res).toEqual(result);
      expect(service.get_blocker_list).toHaveBeenCalledWith(req.user);
    });

    it('should return block list if no query.by exists', async () => {
      const result = { success: true, blockList: [] };
      mockUserService.get_block_list.mockResolvedValue(result);
      const req = mockRequest({ id: '1', username: 'test' }, {});
      const res = await controller.get_block_list(req, undefined);
      expect(res).toEqual(result);
      expect(service.get_block_list).toHaveBeenCalledWith(req.user);
    });
  });

  describe('add_or_remove_from_block_list', () => {
    it('should block user when action is add', async () => {
      const result = { success: true, message: 'Blocked' };
      mockUserService.block_user.mockResolvedValue(result);
      const req = mockRequest({ id: '1', username: 'test' });
      const res = await controller.add_or_remove_from_block_list(
        req,
        'add',
        '2',
      );
      expect(res).toEqual(result);
      expect(service.block_user).toHaveBeenCalledWith('2', req.user);
    });

    it('should unblock user when action is remove', async () => {
      const result = { success: true, message: 'Unblocked' };
      mockUserService.unblock_user.mockResolvedValue(result);
      const req = mockRequest({ id: '1', username: 'test' });
      const res = await controller.add_or_remove_from_block_list(
        req,
        'remove',
        '2',
      );
      expect(res).toEqual(result);
      expect(service.unblock_user).toHaveBeenCalledWith('2', req.user);
    });
  });
});
