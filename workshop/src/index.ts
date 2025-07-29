import dixt from "dixt";

const main = async () => {
  const instance = new dixt({
    application: {
      name: "dixt",
      logo: "https://cdn.discordapp.com/avatars/785435385470779393/8dcbd78a1eae24d2e8874e9569acb3a5.webp",
    },
  });

  await instance.start();
};

main();
