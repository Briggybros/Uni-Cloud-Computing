using System;
using TimberwolfNetHostLib;

namespace TimberwolfNetHostLibExample
{
    internal class Program
    {
        private static void Main(string[] args)
        {
            int count = 0;

            Console.WriteLine("Game started with count=" + count);

            ControllerHost host = ControllerHost.getControllerHost(ControllerHost.CommsType.Relay, "http://localhost:8081", "");

            host.AddEventListener(ControllerHost.EventType.ControllerConnected, (object[] parts) =>
            {
                Console.WriteLine("Controller connected");
            });

            host.AddEventListener(ControllerHost.EventType.ControllerDisconnected, (object[] parts) =>
            {
                Console.WriteLine("Controller disconencted");
            });

            host.AddEventListener(ControllerHost.EventType.Error, (object[] parts) =>
            {
                Console.Error.WriteLine(parts);
            });

            host.AddEventListener(ControllerHost.EventType.Input, (object[] parts) =>
            {
                Console.WriteLine("data received from " + parts[0]);
                Console.WriteLine("parts[1]: " + parts[1]);
                count = count + 1;
                Console.WriteLine("Count updated! count=" + count);
            });

            host.Connect();

            Console.ReadLine();
        }
    }
}
