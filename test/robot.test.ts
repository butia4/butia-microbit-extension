// Tests for RobotDriver singleton lifecycle.

Butia.RobotDriver.start(Butia.butiaV4);
Butia.RobotDriver.start(Butia.butiaV4); // segunda llamada con la misma instancia debe ser no-op, no crashear

Butia.RobotDriver.instance(); // debe retornar sin tirar excepción
basic.showString("PASS singleton");

basic.showString("ALL PASS robot");
