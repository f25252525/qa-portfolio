const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock-data.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Custom routes to match ReqRes API structure
server.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 6;
  const users = router.db.get('users').value();

  // For any page, return the same users to ensure consistent testing
  const data = users.slice(0, perPage);

  res.json({
    page: page,
    per_page: perPage,
    total: 12,
    total_pages: 2,
    data: data,
    support: {
      url: 'https://reqres.in/#support-heading',
      text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
    },
  });
});

// 404 route for unknown endpoint
server.get('/api/unknown/:id', (req, res) => {
  res.status(404).json({});
});

server.use(router);
server.listen(4010, () => {
  console.log('Mock API Server is running on http://localhost:4010');
});
