const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
} = require('graphql')

const app = express()

// data
const authors = [
  {id: 1, name: "J. K. Rowling"},
  {id: 2, name: "J. R. R. Tolkien"},
  {id: 3, name: "Brent Weeks"}
]

const books = [
  {id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1},
  {id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1},
  {id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1},
  {id: 4, name: "The Fellowship of the Ring", authorId: 2},
  {id: 5, name: "The Two Towers", authorId: 2},
  {id: 6, name: "The Return of the King", authorId: 2},
  {id: 7, name: "The Way of Shadows", authorId: 3},
  {id: 8, name: "Beyond the Shadows", authorId: 3},
]

// ---------- custom object ----------
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents the books written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find(author => author.id === book.authorId)
      }
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents all authors",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id)
      }
    }
  })
})

// ---------- root query & root mutation ----------
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "This is a root query",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books
    },
    book: {
      type: BookType,
      description: "A single book",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => books.find(book => book.id === args.id)
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all author",
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: "A single author",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length+1,
          name: args.name,
          authorId: args.authorId,
        }
        books.push(book)
        return book
      }
    },
    addAuthor: {
      type: AuthorType,
      description: "Add an author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString)},
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length+1,
          name: args.name,
        }
        authors.push(author)
        return author
      }
    }
  })
})

// ---------- schema ----------
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
})

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}))

app.listen(3000, () => console.log("Server listen at http://localhost:3000"))
