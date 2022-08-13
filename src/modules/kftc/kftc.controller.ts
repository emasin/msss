import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Logger,
  Post,
  HttpStatus,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { CurrentUser } from '../../common/decorators/user.decorator';
import {SearchEntity} from "../../entities/search/search.entity";


@Controller('v2/api/search/')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);
  constructor(private readonly actionService: SearchService) {}

  @Get('')
  async search(@Param() params, @Query() query): Promise<SearchEntity[]> {
    const options = {
      keyword: query.keyword,
      content_type:query.content_type
    }
    const k = query.keyword;
    const content_type = query.content_type;
    console.log(k);

    return await this.actionService.search(options);
  }


  @Get('/natural')
  async searchNatural(
    @Param() params,
    @Query() query,
  ): Promise<SearchEntity[]> {
    const k = query.keyword;

    return await this.actionService.search2(k);
  }


  @Get('/indexing')
  async indexing(
    @Param() params,
    @Query() query,
  ) {
    const date = query.date;

    await this.actionService.articles(date);

    return date;


  }



  // 20220701
  @Get('/article/indexing/:uid')
  async indexingArticle(
      @Param() params,
      @Query() query,
  ): Promise<number> {
    const uid = params.uid;

    return await  this.actionService.makeNewsIndexOne(uid);


  }



  // 20220701
  @Get('/article/indexing')
  async indexingArticles(
    @Param() params,
    @Query() query,
  ): Promise<number> {
    const date = query.date;
    console.log(date);
    return await  this.actionService.makeNewsIndex(date);


  }

  @Get('/ming/indexing')
  async indexingMing(@Param() params, @Query() query): Promise<SearchEntity> {
    const date = query.date;
    console.log(date);
    const result = await this.actionService.makeMingIndex(date);

    return Object.assign({
      message: 'SUCCESS',
      statusCode: HttpStatus.OK,
      count: result,
      date: date,
    });
  }

  @Get('/vote/indexing')
  async indexingVote(@Param() params, @Query() query): Promise<SearchEntity> {
    const date = query.date;
    console.log(date);
    const result = await this.actionService.makeVoteIndex(date);

    return Object.assign({
      message: 'SUCCESS',
      statusCode: HttpStatus.OK,
      count: result,
      date: date,
    });
  }

}
