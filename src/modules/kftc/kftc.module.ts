import { CacheModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";




import { PlanArticleEntity } from "../../entities/news/plan.article.entity";


import { MongooseModule } from "@nestjs/mongoose";



import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

import {SearchEntity} from "../../entities/search/search.entity";
import { PostEntity } from "src/entities/post/post.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [PlanArticleEntity],
      "db_news_article"
    ),

    TypeOrmModule.forFeature(
      [SearchEntity],
        'db_search'
    ),

    TypeOrmModule.forFeature(
        [PostEntity]
    ),


  ],
  controllers: [SearchController],
  exports: [SearchService],
  providers: [SearchService],
})
export class SearchModule {}
