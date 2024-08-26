export const PLANS = [
    {
      name: 'Free',
      slug: 'free',
      quota: 5,
      pagesPerPdf: 5,
      price: {
        amount: 0,
        priceIds: {
          test: '',
          production: '',
        },
      },
      fileTypes: {
       "application/pdf": [".pdf"],
       "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
       [".docx"],
     "application/msword": [".doc"],
     "text/plain": [".txt"]
      }
    },
    {
      name: 'Pro',
      slug: 'pro',
      quota: 50,
      pagesPerPdf: 25,
      fileSize: 50, 
      price: {
        amount: 14,
        priceIds: {
          test: 'price_1P3GINFPM7UolLvTrYd2Yr8T',
          production: '',
        },
      },
      fileTypes: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "application/msword": [".doc"],
        "text/plain": [".txt"]
      }
    },
  ]