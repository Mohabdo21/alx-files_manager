function withTryCatch(promise) {
  return async (req, res) => {
    try {
      return await promise(req, res);
    } catch (err) {
      console.error({ err });
      return res.status(500).json({ error: 'Unexpected error' });
    }
  };
}

export default withTryCatch;
