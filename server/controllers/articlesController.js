import db from '../models';
import generateUniqueSlug from '../helpers/generateUniqueSlug';

const { Profile, Article, Category, User } = db;
/**
* @description class will implement CRUD functionalities for articles
* @class ArticleController
*/
class ArticlesController {
  /**
   * @param {object} req - Request sent to the route
   * @param {object} res - Response sent from the controller
   * @param {object} next - Error handler
   * @param {object} article
   * @returns {object} - object representing response message
   */
  static async createArticle(req, res, next) {

    const { id } = req.user;
    const { categoryId } = req.body;
    const articleSlug = generateUniqueSlug(req.body.title);
    try {

      const category = await Category.findOne({
        where: { id: categoryId }
      });

      const profileId = await Profile.findOne({
        where: { userId: id }
      });

      if (!profileId || profileId === null) {
        return res.status(404).json({
          success: false,
          message: 'User does not exist'
        });
      }
      if (!category) {
        return res.status(400).send({
          success: false,
          message: 'Category does not exist',
        });
      }
      const article = await Article.create({
        title: req.body.title.trim(),
        body: req.body.body.trim(),
        slug: articleSlug,
        published: req.body.published,
        userId: id,
        profileId: profileId.dataValues.id,
        categoryId: req.body.categoryId.trim()
      });

      return res.status(201).send({
        success: true,
        message: 'Article created successfully',
        article
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @param {object} req - Request sent to the route
   * @param {object} res - Response sent from the controller
   *  @param {object} next - Error handler
   * @param {object} id
   * @returns {object} - object representing response message
   */
  static async getOneArticle(req, res, next) {
    const { id } = req.params;
    try {
      const article = await Article.findOne({
        where: { id },
        include: [{
          model: User,
          as: 'author',
          attributes: {
            exclude: [
              'id',
              'password',
              'createdAt',
              'firstName',
              'lastName',
              'email',
              'updatedAt',
              'verified',
              'blocked',
              'emailNotification']
          }
        },
        {
          model: Profile,
          as: 'authorProfile',
          attributes: {
            exclude: [
              'createdAt',
              'updatedAt',
              'gender',
              'twitterUrl',
              'facebookUrl',
              'dateOfBirth',
              'userId']
          }
        }],
      });

      if (!article) {
        return res.status(404).json({
          success: 'false',
          message: 'Article not found',
        });
      }
      return res.status(200).json({
        success: 'true',
        message: 'Retrieved article successfully',
        article
      });

    } catch (error) {
      return next(error);
    }
  }

  /**
 * @param {object} req - Request sent to the route
 * @param {object} res - Response sent from the controller
 *  @param {object} next - Error handler
 * @param {object} id
 * @returns {object} - object representing response message
 */
  static async getAllArticles(req, res, next) {
    try {
      const articles = await Article.findAndCountAll(
        {
          include: [{
            model: User,
            as: 'author',
            attributes: {
              exclude: [
                'id',
                'password',
                'createdAt',
                'firstName',
                'lastName',
                'email',
                'updatedAt',
                'verified',
                'blocked',
                'emailNotification']
            }
          },
          {
            model: Profile,
            as: 'authorProfile',
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'gender',
                'twitterUrl',
                'facebookUrl',
                'dateOfBirth',
                'userId']
            }
          }],
        });

      if (!articles || articles.count == 0) {
        return res.status(404).json({
          success: 'false',
          message: 'No article created yet',
        });
      }

      return res.status(200).json({
        success: 'true',
        message: 'Retrieved article successfully',
        articles
      });

    } catch (error) {
      return next(error);
    }
  }


  /**
 * @param {object} req - Request sent to the route
 * @param {object} res - Response sent from the controller
 *  @param {object} next - Error handler
 * @param {object} id
 * @returns {object} - object representing response message
 */
  static async getAuthorsArticles(req, res, next) {
    const { authorsId } = req.params;
    try {
      const articles = await Article.findAndCountAll(
        {
          where: { userId: authorsId },
          include: [{
            model: User,
            as: 'author',
            attributes: {
              exclude: [
                'id',
                'password',
                'createdAt',
                'firstName',
                'lastName',
                'email',
                'updatedAt',
                'verified',
                'blocked',
                'emailNotification']
            }
          },
          {
            model: Profile,
            as: 'authorProfile',
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'gender',
                'twitterUrl',
                'facebookUrl',
                'dateOfBirth',
                'userId']
            }
          }],

        });

      if (!articles || articles.count == 0) {
        return res.status(404).json({
          success: 'false',
          message: 'No article created yet',
        });
      }

      return res.status(200).json({
        success: 'true',
        message: 'Retrieved article successfully',
        articles
      });

    } catch (error) {
      return next(error);
    }
  }


  /**
 * @description - method for updating an article
 * @returns {object} - object representing response message
 * @param {object} req - Request sent to the route
 * @param {object} res - Response sent from the controller
 * @param {object} next - Error handler
 */
  static async updateArticle(req, res, next) {
    const { title } = req.body;
    const { id } = req.params;

    let articleSlug = '';

    if (title) {
      articleSlug = generateUniqueSlug(title);
    }

    try {
      const article = await Article.findOne({
        where: { id }
      });

      if (!article) {
        return res.status(404).json({
          success: 'false',
          message: 'Article not found',
        });
      }
      await Article.update(
        {
          title: req.body.title || article.title,
          slug: articleSlug || article.slug,
          body: req.body.body || article.body,
          categoryId: req.body.categoryId || article.categoryId
        },
        {
          where: { id }
        }
      );

      return res.status(200).json({
        success: 'true',
        message: 'Article updated successfully',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
* @param {object} req - Request sent to the route
* @param {object} res - Response sent from the controller
*  @param {object} next - Error handler
* @param {object} id
* @returns {object} - object representing response message
*/
  static async deleteArticle(req, res, next) {
    const { id } = req.params;
    try {
      const article = await Article.findOne({
        where: { id }
      });

      if (!article) {
        return res.status(404).json({
          success: 'false',
          message: 'Article not found',
        });
      }

      await Article.destroy({
        where: {
          id
        }
      });

      return res.status(200).json({
        success: 'true',
        message: 'Article deleted successfully',
      });

    } catch (error) {
      return next(error);
    }
  }

}

export default ArticlesController;
