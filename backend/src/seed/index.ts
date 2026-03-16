import { AppDataSource } from "../ormconfig";
import { featureSeed } from "./feature.seed";

const runSeeds = async () => {
  await AppDataSource.initialize();
  console.log("DB connectée, lancement des seeds...");

  await featureSeed();

  console.log("✅ Seeds terminés");
  process.exit(0);
};

runSeeds().catch((err) => {
  console.error("Erreur pendant le seed :", err);
  process.exit(1);
});
