# Primeros pasos con Butia

## Primeros pasos @showdialog

En este tutorial vas a aprender a mover el robot Butia hacia adelante, detenerlo,
girar y controlar cada motor por separado. ¡Vamos!

## El simulador @showhint

Butia trae un simulador integrado. Arrastrá el bloque `||Butia:usar mapa||` dentro de
`||basic:on start||` y elegí el mapa **Mesa** para tener un espacio abierto donde probar
los movimientos. No hace falta elegir ningún robot: Butia v4 se usa automáticamente.

```blocks
// @highlight
Butia.setMap(SimMap.Mesa)
```

## Avanzar

Agregá un bloque `||Butia:Avanzar a velocidad||` para que el robot avance.
La velocidad va de 0 a 100.

```blocks
Butia.setMap(SimMap.Mesa)
// @highlight
Butia.moveForward(60)
```

## Detener motores

Esperá un segundo y usá `||Butia:Detener Motores||` para frenar el robot.

```blocks
Butia.setMap(SimMap.Mesa)
Butia.moveForward(60)
basic.pause(1000)
// @highlight
Butia.motorStop()
```

## Girar

Agregá un bloque `||Butia:Girar hacia||` para que el robot gire hacia la derecha
durante medio segundo.

```blocks
Butia.setMap(SimMap.Mesa)
Butia.moveForward(60)
basic.pause(1000)
Butia.motorStop()
basic.pause(500)
// @highlight
Butia.turn(TurnDirection.Right, 40, 0.5)
```

## Controlar cada motor por separado

Con `||Butia:Motor Izquierdo Derecho||` podés mandarle una velocidad distinta a cada
motor (de -100 a 100). Esto te da control total, ideal para movimientos más finos.

```blocks
Butia.setMap(SimMap.Mesa)
Butia.moveForward(60)
basic.pause(1000)
Butia.motorStop()
basic.pause(500)
Butia.turn(TurnDirection.Right, 40, 0.5)
basic.pause(500)
// @highlight
Butia.motorTank(70, -70)
```

## ¡A programar! @showdialog

Ya sabés lo básico para mover a Butia. Probá combinar `||Butia:Avanzar a velocidad||`,
`||Butia:Girar hacia||`, `||Butia:Motor Izquierdo Derecho||` y `||Butia:Detener Motores||`
para armar una coreografía o un recorrido propio. ¡Éxitos!