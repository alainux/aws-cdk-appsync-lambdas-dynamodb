export const handler = async () => {
  return [
    {
      id: "abc-123",
      title: "My awesome book",
      completed: true,
      rating: 10,
      reviews: ["The best book ever written"],
    },
    {
      id: "def-456",
      title: "A terrible book",
      completed: true,
      rating: 2,
      reviews: ["What did I just read?!"],
    },
  ];
};
