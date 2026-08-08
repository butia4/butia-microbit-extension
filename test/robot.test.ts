// Tests for RobotDriver singleton lifecycle.

butia.RobotDriver.start(butia.butiaV4);
butia.RobotDriver.start(butia.butiaV4); // segunda llamada con la misma instancia debe ser no-op, no crashear

butia.RobotDriver.instance(); // debe retornar sin tirar excepción
basic.showString("PASS singleton");

basic.showString("ALL PASS robot");
