import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreateDocumentDto } from '../dtos/create-document.dto';
import { DocumentQueryDto } from '../dtos/document-query.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  async list(
    organizationId: string,
    query: DocumentQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.DocumentWhereInput = {
      organizationId,
      status: 'ACTIVE',
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.landlordId) {
      where.landlordId = query.landlordId;
    }

    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, organizationId },
      include: { versions: true, grants: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async create(
    organizationId: string,
    data: CreateDocumentDto,
    createdById: string,
  ) {
    const creator = await this.prisma.user.findFirst({
      where: { id: createdById, organizationId, status: 'ACTIVE' },
    });
    if (!creator) throw new NotFoundException('Document creator not found');

    if (data.landlordId) {
      const landlord = await this.prisma.landlord.findFirst({
        where: { id: data.landlordId, organizationId },
      });
      if (!landlord) throw new NotFoundException('Landlord not found');
    }

    if (data.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: {
          id: data.propertyId,
          organizationId,
          ...(data.landlordId ? { landlordId: data.landlordId } : {}),
        },
      });
      if (!property) throw new NotFoundException('Property not found');
    }

    return this.prisma.document.create({
      data: {
        organizationId,
        ...data,
        createdById,
      },
    });
  }

  async addVersion(
    organizationId: string,
    documentId: string,
    file: {
      storageKey: string;
      originalFileName: string;
      mimeType: string;
      byteSize: number;
      checksum: string;
    },
    uploadedById: string,
  ) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, organizationId, status: 'ACTIVE' },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const uploader = await this.prisma.user.findFirst({
      where: { id: uploadedById, organizationId, status: 'ACTIVE' },
    });
    if (!uploader) throw new NotFoundException('Uploader not found');

    const nextVersion = (document.versions[0]?.version ?? 0) + 1;

    return this.prisma.documentVersion.create({
      data: {
        documentId,
        version: nextVersion,
        ...file,
        uploadedById,
      },
    });
  }

  async getDownloadUrl(
    organizationId: string,
    documentId: string,
    version: number,
  ) {
    const documentVersion = await this.prisma.documentVersion.findFirst({
      where: {
        documentId,
        version,
        document: { organizationId, status: 'ACTIVE' },
      },
    });

    if (!documentVersion) {
      throw new NotFoundException('Document version not found');
    }

    if (!this.storage.isConfigured()) {
      throw new ForbiddenException('Storage not configured');
    }

    return this.storage.createSignedDownloadUrl(documentVersion.storageKey);
  }
}
