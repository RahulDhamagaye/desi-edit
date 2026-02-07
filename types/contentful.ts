export type ContentfulAsset = {
  fields: {
    title?: string;
    file: {
      url: string;
      contentType?: string;
      details?: {
        image?: {
          width: number;
          height: number;
        };
      };
    };
  };
};
