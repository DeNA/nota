export const getVis = () => {
  return new Promise(resolve => {
    resolve({
      test_timeline: {
        values: [[0, 0]]
      },
      test_timeline_2: {
        values: [[0, 1]]
      }
    });
  });
};
