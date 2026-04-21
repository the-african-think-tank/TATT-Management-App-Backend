import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BusinessDirectoryService } from './business-directory.service';
import { BusinessPartner } from './entities/business-partner.entity';
import { Partnership } from '../partnerships/entities/partnership.entity';
import { MailService } from '../../common/mail/mail.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BusinessDirectoryService', () => {
  let service: BusinessDirectoryService;
  let model: typeof BusinessPartner;
  let mailService: MailService;

  const mockBusinessPartner = {
    id: 'biz-123',
    name: 'Test Business',
    contactEmail: 'test@example.com',
    contactName: 'Test Owner',
    status: 'PENDING',
    adminNotes: '',
    save: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
  };

  const mockBusinessPartnerModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    sequelize: {
      fn: jest.fn(),
      col: jest.fn(),
    },
  };

  const mockPartnershipModel = {
    findAll: jest.fn(),
    count: jest.fn(),
  };

  const mockMailService = {
    sendBusinessSubmissionEmail: jest.fn(),
    sendBusinessApprovedEmail: jest.fn(),
    sendBusinessDeclinedEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessDirectoryService,
        {
          provide: getModelToken(BusinessPartner),
          useValue: mockBusinessPartnerModel,
        },
        {
          provide: getModelToken(Partnership),
          useValue: mockPartnershipModel,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<BusinessDirectoryService>(BusinessDirectoryService);
    model = module.get<typeof BusinessPartner>(getModelToken(BusinessPartner));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('apply', () => {
    const dto: any = {
      name: 'New Business',
      category: 'Technology',
      isVolunteer: true,
      description: 'A tech startup',
      ownershipType: 'Black-owned',
      partnershipReason: 'To grow network',
      benefitType: 'Percentage discount',
      offerDuration: '12 months',
      typicalEngagement: 'Direct sales',
      contactEmail: 'apply@example.com',
      contactName: 'Applicant',
    };

    it('should create a new business application with all fields', async () => {
      mockBusinessPartnerModel.findOne.mockResolvedValue(null);
      mockBusinessPartnerModel.create.mockResolvedValue({ ...mockBusinessPartner, ...dto });

      const result = await service.apply(dto, 'user-123');

      expect(model.create).toHaveBeenCalledWith({
        ...dto,
        submittedById: 'user-123',
        status: 'PENDING',
      });
      expect(mailService.sendBusinessSubmissionEmail).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
      expect(result.description).toBe(dto.description);
    });

    it('should throw ConflictException if user already has a business', async () => {
      mockBusinessPartnerModel.findOne.mockResolvedValue(mockBusinessPartner);

      await expect(service.apply(dto, 'user-123')).rejects.toThrow(ConflictException);
    });
  });

  describe('upsertMyBusiness', () => {
    const dto: any = {
      name: 'Updated Business',
      description: 'Updated description',
    };

    it('should create new business if none exists', async () => {
      mockBusinessPartnerModel.findOne.mockResolvedValue(null);
      mockBusinessPartnerModel.create.mockResolvedValue({ ...mockBusinessPartner, ...dto });

      await service.upsertMyBusiness('user-123', dto, 'STANDARD');

      expect(model.create).toHaveBeenCalled();
      expect(mailService.sendBusinessSubmissionEmail).toHaveBeenCalled();
    });

    it('should update existing business', async () => {
      const existingBiz = { ...mockBusinessPartner, update: jest.fn().mockResolvedValue(true) };
      mockBusinessPartnerModel.findOne.mockResolvedValue(existingBiz);

      await service.upsertMyBusiness('user-123', dto, 'STANDARD');

      expect(existingBiz.update).toHaveBeenCalledWith({
        ...dto,
        status: 'PENDING',
      });
    });

    it('should auto-approve for KIONGOZI tier', async () => {
      mockBusinessPartnerModel.findOne.mockResolvedValue(null);
      mockBusinessPartnerModel.create.mockResolvedValue({ ...mockBusinessPartner, status: 'APPROVED' });

      await service.upsertMyBusiness('user-123', dto, 'KIONGOZI');

      expect(model.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'APPROVED',
      }));
      expect(mailService.sendBusinessApprovedEmail).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status to APPROVED and send email', async () => {
      const biz = { ...mockBusinessPartner, status: 'PENDING', save: jest.fn().mockResolvedValue(true) };
      mockBusinessPartnerModel.findByPk.mockResolvedValue(biz);

      await service.updateStatus('biz-123', { status: 'APPROVED' });

      expect(biz.status).toBe('APPROVED');
      expect(biz.save).toHaveBeenCalled();
      expect(mailService.sendBusinessApprovedEmail).toHaveBeenCalled();
    });

    it('should update status to DECLINED and send email with notes', async () => {
      const biz = { ...mockBusinessPartner, status: 'PENDING', save: jest.fn().mockResolvedValue(true) };
      mockBusinessPartnerModel.findByPk.mockResolvedValue(biz);

      await service.updateStatus('biz-123', { status: 'DECLINED', adminNotes: 'Missing info' });

      expect(biz.status).toBe('DECLINED');
      expect(biz.adminNotes).toBe('Missing info');
      expect(mailService.sendBusinessDeclinedEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        'Missing info'
      );
    });
  });
});
