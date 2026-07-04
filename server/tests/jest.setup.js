process.env.NODE_ENV = 'test';
// Reuse the already-installed local MongoDB binary instead of letting
// mongodb-memory-server try to download one.
process.env.MONGOMS_SYSTEM_BINARY = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
