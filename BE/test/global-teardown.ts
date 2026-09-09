export default async function () {
  const mongod = (globalThis as any).__MONGOD__;
  if (mongod) await mongod.stop();
}
