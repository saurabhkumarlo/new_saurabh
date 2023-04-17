export const getModelFile = (fileId) => `${process.env.REACT_APP_IFC_CONVERSION_BUCKET_URL}${fileId}/${fileId}.json`;
