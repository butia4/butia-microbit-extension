# Primeros pasos con Butia

## Primeros pasos @showdialog

En este tutorial vas a aprender a mover el robot Butia hacia adelante, hacia
atrás, detenerlo y girar. ¡Vamos!

## Avanzar

Agregá un bloque `||Butia:Avanzar a velocidad||` para que el robot avance.
La velocidad va de 0 a 100.

```blocks
// @highlight
Butia.moveForward(60)
```

## Detener motores

Esperá un segundo y usá `||Butia:Detener Motores||` para frenar el robot.

```blocks
Butia.moveForward(60)
basic.pause(1000)
// @highlight
Butia.motorStop()
```

## Retroceder

Agregá un bloque `||Butia:Retroceder a velocidad||` para que el robot vaya
hacia atrás.

```blocks
Butia.moveForward(60)
basic.pause(1000)
Butia.motorStop()
basic.pause(500)
// @highlight
Butia.moveBackward(60)
```

## Detener motores otra vez

Frená de nuevo antes de girar.

```blocks
Butia.moveForward(60)
basic.pause(1000)
Butia.motorStop()
basic.pause(500)
Butia.moveBackward(60)
basic.pause(1000)
// @highlight
Butia.motorStop()
```

## Girar

Agregá un bloque `||Butia:Girar hacia||` para que el robot gire hacia la
derecha durante medio segundo.

```blocks
Butia.moveForward(60)
basic.pause(1000)
Butia.motorStop()
basic.pause(500)
Butia.moveBackward(60)
basic.pause(1000)
Butia.motorStop()
basic.pause(500)
// @highlight
Butia.turn(TurnDirection.Right, 40, 0.5)
```

## ¡A programar! @showdialog

Ya sabés lo básico para mover a Butia: avanzar, retroceder, detenerse y
girar. Probá combinar estos bloques para armar una coreografía o un
recorrido propio. ¡Éxitos!