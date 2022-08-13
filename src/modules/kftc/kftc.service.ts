
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {getConnection, Repository} from 'typeorm';

import { PlanArticleEntity } from '../../entities/news/plan.article.entity';
import {SearchEntity} from "../../entities/search/search.entity";

import {Cron, CronExpression} from "@nestjs/schedule";
import {SearchRepository} from "./search.repository";
import {PostEntity} from "../../entities/post/post.entity";

/**
 * Profile Service
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  /**
   * Constructor
   * @param {Repository<Roles>} rolesRepository
   */
  constructor(


    @InjectRepository(PlanArticleEntity, 'db_news_article')
    private readonly feedRepository: Repository<PlanArticleEntity>,

    @InjectRepository(SearchEntity,'db_search')
    private readonly searchRepository: Repository<SearchEntity>,

    @InjectRepository(PostEntity,)
    private readonly postRepository: Repository<PostEntity>,


  ) {}


  async  search2(k:string) :Promise<SearchEntity[]> {
    const q = `select content_type,
             content_uid,
             IF(title = '', content, title) as title,
             '' as extra,
             image,
             published_at,
             user_nm,
             user_id
      from nm_search
      WHERE MATCH (title,content) AGAINST ('${k}' IN NATURAL LANGUAGE MODE)`;
//
    console.log(q);

    const result:SearchEntity[] = await this.searchRepository.query(q);


    return result;
  }

  async  search(k:any) :Promise<SearchEntity[]> {
    const condition_content_type = k.content_type ? ` and content_type = ${k.content_type} ` : '';

    const q = `select content_type,
             content_uid,
             IF(title = '', content, title) as title,
             '' as extra,
             image,
             published_at,
             user_nm,
             user_id
      from nm_search
       WHERE MATCH (fullcontent) AGAINST ('${k.keyword.split(' ').map((w)=>{ return '+' + w}).join(' ')}' IN BOOLEAN MODE)
       ${condition_content_type}
       limit 100`;
//IN NATURAL LANGUAGE MODE
    console.log(q);

    let result:SearchEntity[] = await this.searchRepository.query(q);
    console.log('q result.length',result.length);
    if(result.length < 1)  {
      const q2 = `select content_type,
             content_uid,
             IF(title = '', content, title) as title,
             '' as extra,
             image,
             published_at,
             user_nm,
             user_id
      from nm_search
      WHERE MATCH (fullcontent) AGAINST ('${k}' IN NATURAL LANGUAGE MODE)
      limit 100`;
      result = await this.searchRepository.query(q2);
      console.log('q2 result.length',result.length);
    }


    return result;
  }



  async  makeMingIndex(date:string) :Promise<number> {
    const result:SearchEntity[] = await this.postRepository.query(`
      select 5 as content_type,
             _id as content_uid,
             name as title,
             description as content,
             '' as extra,
             logo_image as image,
             created_at as published_at,
             concat(name,' ',description) as fullcontent,
             DATE_FORMAT(created_at,'%Y%m%d') as date,
             '' as user_nm,
             '' as user_id
      from nm_channel
      where archived = 0 and hidden = 0 and blocked = 0
    `);


    await this.searchRepository.save(result);

    return 0;
  }




  async  makeVoteIndex(date:string) :Promise<number> {
    const result:SearchEntity[] = await this.postRepository.query(`
      select 3 as content_type,
             _id as content_uid,
             post_title as title,
             post_content as content,
             extras as extra,
             '' as image,
             created_at as published_at,
             DATE_FORMAT(created_at,'%Y%m%d') as date,
             user_name as user_nm,
             user_id as user_id
        from nm_post
       where  post_type = 'vote'
         and archived = 0 and hidden = 0 and blocked = 0
    `);

    result.map(async (v)=>{

      const json =  JSON.parse(v.extra);
      v.content += json.votes.keys.map((c)=>{ return c.content}).join(' ');
      v.fullcontent = `${v.title} ${v.content} ${v.date}`;

    });


    await this.searchRepository.save(result);

    return 0;
  }

  async  makeNewsIndexOne(uid:string) :Promise<number> {

    let count = 0;
    const tables = await this.feedRepository.query(
        `
                         select hash_table as TABLE_NAME from nm_press_article
where hash_key = '${uid}'
                        ;`
    );

    // for(let t in tables) {

    let _articles: any[] = [];

    tables.map(async (t) => {



      // @ts-ignore
      const TABLE_NAME = t.TABLE_NAME;

      _articles = await this.feedRepository.query(
          `
          select 1 as content_type,
                 _key as content_uid,
                 title,
                 text as content,
                 '' as extra,
                 thumbnail as image,
                 published_at,
                 DATE_FORMAT(published_at,'%Y%m%d') as date,
                 (select name
                  from nm_press
                  where nm_press._id = article.press_id) as user_nm, press_id as user_id
          from ${TABLE_NAME} as article
          where  _key = '${uid}'
        `,
      );


      const result = await this.searchRepository.save(_articles);
      _articles = null;

    });

    return 0;



  }


  async  makeNewsIndex(date:string) :Promise<number> {

      let count = 0;
      const tables = await this.feedRepository.query(
        `
                         SELECT TABLE_NAME FROM Information_schema.tables
                          WHERE table_schema = 'newming_press_article'
                           and table_name like 'nm_press_article_${ date }%'
                         order by  TABLE_NAME desc
                        ;`
      );

     // for(let t in tables) {

      let _articles: any[] = [];

     tables.map(async (t) => {



      // @ts-ignore
      const TABLE_NAME = t.TABLE_NAME;

      _articles = await this.feedRepository.query(
        `
          select 1 as content_type,
                 _key as content_uid,
                 title,
                 text as content,
                 '' as extra,
                 thumbnail as image,
                 published_at,
                 concat(title,' ',text,' ',DATE_FORMAT(published_at,'%Y%m%d')) as fullcontent,
                 DATE_FORMAT(published_at,'%Y%m%d') as date,
                 (select name
                  from nm_press
                  where nm_press._id = article.press_id) as user_nm, press_id as user_id
          from ${TABLE_NAME} as article
        `,
      );


       const result = await this.searchRepository.save(_articles);
       _articles = null;

    });

     return 0;

  }

  async  makeIndex(date:string) :Promise<number> {

    let count = 0;
    const tables = await this.feedRepository.query(
      `
                         SELECT TABLE_NAME FROM Information_schema.tables
                          WHERE table_schema = 'newming_press_article'
                           and table_name like 'nm_press_article_${ date }%'
                         order by  TABLE_NAME desc
                        ;`
    );

    // for(let t in tables) {
    tables.map(async (t) => {
      // @ts-ignore
      const TABLE_NAME = t.TABLE_NAME;
      console.log(TABLE_NAME)
      const _articles: any[] = await this.feedRepository.query(
        `
          select 1 as content_type,
                 _key as content_uid,
                 title,
                 text as content,
                 '' as extra,
                 thumbnail as image,
                 published_at,
                 concat(title,' ',text,' ',DATE_FORMAT(published_at,'%Y%m%d')) as fullcontent,
                 DATE_FORMAT(published_at,'%Y%m%d') as date,
                 (select name
                  from nm_press
                  where nm_press._id = article.press_id) as user_nm, press_id as user_id
          from ${TABLE_NAME} as article
        `,
      );
      console.log('_articles', _articles.length);
      count += _articles.length;
      const result = await this.searchRepository.save(_articles);

    });

    return count;

  }



  async tables(date: string) {

    return  await this.feedRepository.query(
      `
                         SELECT TABLE_NAME FROM Information_schema.tables
                          WHERE table_schema = 'newming_press_article'
                           and table_name like 'nm_press_article_${ date }%'
                         order by  TABLE_NAME desc
                        `
    );


  }

  async articles(date: string) {

    const queryRunner2 = await getConnection("db_news_article").createQueryRunner();
    let _articles:SearchEntity[] = [];
    let arry:any[] = [];
    try {

      const tables:any[] = await queryRunner2.manager.query(`
      SELECT TABLE_NAME FROM Information_schema.tables
                          WHERE table_schema = 'newming_press_article'
                           and table_name like 'nm_press_article_${ date }%'
                         order by  TABLE_NAME desc`
      );
      await Promise.all( tables.map(async (t) => {
        _articles = await queryRunner2.manager.query(
          `
            select 1         as content_type,
                   _key as      content_uid,
                   title,
                   text      as content,
                   ''        as extra,
                   thumbnail as image,
                   published_at,
                   concat(title,' ',text,' ',DATE_FORMAT(published_at,'%Y%m%d')) as fullcontent,
                   DATE_FORMAT(published_at,'%Y%m%d') as date,
                   (select name
                    from nm_press
                    where nm_press._id = article.press_id) as user_nm, press_id as user_id
            from ${t.TABLE_NAME} as article
          `,
        );


        arry.push(_articles);

        //await this.indexing(_articles);
      }));
      this.logger.log("arry",arry.length);

      await this.indexing(arry);

    }finally {
      await queryRunner2.release();
    }
   // return  _articles;


  }

  async indexing(entities:any[]) {
    console.log(entities.length);
    const queryRunner2 = await getConnection("db_search").createQueryRunner()
    await  queryRunner2.connect();
    await  queryRunner2.startTransaction();
    const repo = queryRunner2.manager.getCustomRepository(SearchRepository);
    try {


      //const repo = queryRunner2.manager.getCustomRepository(SearchRepository);
      await Promise.all(
        entities.map(async (_articles) => {
          await Promise.resolve(_articles.length) ;
          const r = await repo.save(_articles);

      }));



      await  queryRunner2.commitTransaction();
      console.log('queryRunner commitTransaction');
    } catch(err) {
      console.log('queryRunner rollbackTransaction',err);
      await queryRunner2.rollbackTransaction();
    } finally {
      await queryRunner2.release();
      console.log('queryRunner release');
    }
  }

}
