/**
 * helper function to handle promises properly
 * @param {(req: Object, res: Object) => Promise<any>} promise - callback function returns a promise
 *
 * @returns {(req: Object, res: Object) => Promise<any>}
 * asyncronous function with error handling for unexepected error
 */
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
