import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryResource } from './entities/library-resource.entity';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
  imports: [TypeOrmModule.forFeature([LibraryResource])],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService, TypeOrmModule],
})
export class LibraryModule {}
