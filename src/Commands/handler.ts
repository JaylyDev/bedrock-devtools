import { Player, world, NumberRange } from "@minecraft/server";

interface BaseCommandArgumentData {
  type: string;
  optional: boolean;
};

interface CommandArgumentString extends BaseCommandArgumentData {
  type: "string";
  choices?: string[];
};

interface CommandArgumentNumber extends BaseCommandArgumentData {
  type: "int" | "float";
  range?: NumberRange;
};

interface CommandArgumentBool extends BaseCommandArgumentData {
  type: "bool";
};

type CommandArgumentData = CommandArgumentString | CommandArgumentNumber | CommandArgumentBool;

interface CommandData<T extends Record<string, CommandArgumentData>> {
  /**
   * Name of the chat command, prefix included
   */
  name: string;
  /**
   * Description of the command, shown in the help menu
   */
  description: string;
  /**
   * Arguments of the command.
   */
  args: T;
  /**
   * Decides who can use this command. If `true` command can be used by operators only.
   */
  permission: boolean;
  /**
   * Callback function that is called when the command is executed.
   */
  callback: (response: CommandResponse<T>) => void;
};

const commands = new Map<string, CommandData<any>>();

class CommandResponse<T extends Record<string, CommandArgumentData>>{
  readonly sender: Player;
  readonly params: {
    [K in keyof T]: T[K] extends CommandArgumentString
    ? (T[K]['optional'] extends true ? string | undefined : string)
    : T[K] extends CommandArgumentNumber
    ? (T[K]['optional'] extends true ? number | undefined : number)
    : T[K] extends CommandArgumentBool
    ? (T[K]['optional'] extends true ? boolean | undefined : boolean)
    : never;
  } = {} as any;

  constructor(sender: Player, commandData: CommandData<T>, argv: (string | number | boolean | undefined)[]) {
    this.sender = sender;
    // If there are argv, map it to a record
    if (argv.length > 0) {
      Object.keys(commandData.args)
            .forEach((key, index) => Object.assign(this.params, { [key]: argv[index] }));
    } else {
      const params = {} as any;
      this.params = params;
    };
  };
};

/**
 * Returns an array containing the command-line arguments passed when the chat message was sent.
 * @param input 
 * Text input. To escape double quotes, you need double backslash to escape double quotes
 * ```js
 * parseArgv('hello world "hello world" "hello \\"world\\""')
 * [ 'hello', 'world', 'hello world', 'hello "world"' ]
 * ```
 * @returns 
 */
function parseArgv(input: string) {
  const regex = /"((?:\\"|[^"])+)"|(\S+)/g;
  const result: string[] = [];
  let match: RegExpExecArray | null;
  while (match = regex.exec(input)) {
    const arg = match[1] !== undefined ? match[1].replace(/\\"/g, '"') : match[2];
    result.push(arg);
  };
  return result;
};

function getOptionalIndex(args: Record<string, CommandArgumentData>) {
  return Object.values(args).findIndex(arg => arg.optional);
}

function registerChatCommand<T extends Record<string, CommandArgumentData>>(command: Omit<CommandData<T>, "callback"> | ChatCommandBuilder<T>, callback: (response: CommandResponse<T>) => void) {
  // If command is an instance of ChatCommandBuilder, it will be converted to a CommandData instance.
  if (command instanceof ChatCommandBuilder) {
    command = command.build();
  };

  // Check if command arguments are optional, if one is optional, the rest have to be optional, or else throw error. 
  // for example, if there are 5 arguments and the first one is optional, the rest have to be optional.
  const optionalIndex = getOptionalIndex(command.args);
  if (optionalIndex !== -1) {
    for (let i = optionalIndex + 1; i < Object.keys(command.args).length; i++) {
      if (!command.args[i].optional) {
        throw new Error(`Command ${command.name} has required parameter(s) that follows an optional parameter, which is not allowed.`);
      }
    }
  };

  // Register if it meets all requirements above
  const commandPayload = Object.assign(command, { callback });
  commands.set(command.name, commandPayload);
};

function parseBoolean(str: string): boolean | null {
  try {
    const data = JSON.parse(str.toLowerCase());
    if (data === true || data === false) return data;
    else return null;
  }
  catch {
    return null;
  }
}


function validateCommand(argv: string[], commandData: CommandData<Record<string, CommandArgumentData>>, sender: Player): (string | number | boolean | undefined)[] | void {
  const numberIsValid = (num: number, argumentData: CommandArgumentNumber, argumentName: string) => {
    // checks if a number is actually a number
    if (isNaN(num)) {
      sender.sendMessage(`§cArgument '${argumentName}' is not a number`);
      return false;
    };
    // checks if the number is in the range of the argument
    if (argumentData.range) {
      const { max, min } = argumentData.range;
      if (num < min || num > max) {
        sender.sendMessage(`§cArgument '${argumentName}' must be between ${min} and ${max}`);
        return false;
      }
    };
    return true;
  };

  const commandArgsLength = Object.keys(commandData.args).length;
  // checks if the number of arguments is over expected arguments
  if (argv.length > commandArgsLength) {
    sender.sendMessage(`§cCommand '${commandData.name}' expects ${commandArgsLength} arguments, received ${argv.length}`);
    return;
  }
  // checks if the number of arguments is under expected arguments
  else if (commandArgsLength === 0) {
    return argv;
  }
  else {
    const optionalIndex = getOptionalIndex(commandData.args);

    // has optional args but not enough 
    if (optionalIndex > 0 && argv.length < optionalIndex) {
      sender.sendMessage(`§cCommand '${commandData.name}' expects ${optionalIndex}-${commandArgsLength} arguments, received ${argv.length}`);
      return;
    }
    // No optional args
    else if (optionalIndex < 0 && argv.length < commandArgsLength) {
      sender.sendMessage(`§cCommand '${commandData.name}' expects ${commandArgsLength} arguments, received ${argv.length}`);
      return;
    };

    const args = argv.map((arg, index) => {
      const argumentName = Object.keys(commandData.args)[index];
      const argumentData = commandData.args[argumentName];

      // checks if argument is required but doesn't have input
      if (!arg && !argumentData.optional) {
        sender.sendMessage(`§cArgument '${argumentName}' is required`);
        return null;
      }
      // returns if no input but argument is optional
      else if (!arg && argumentData.optional) {
        // Returns undefined if value is none and it's optional
        return undefined;
      };

      if (argumentData.type === "string") {
        if (!!argumentData.choices && !argumentData.choices.includes(arg)) {
          sender.sendMessage(`§cA valid choice is required for '${argumentName}':\n${argumentData.choices.map(choice => '- ' + choice).join('\n')}`);
          return null;
        }
        else return arg;
      } else if (argumentData.type === "int") {
        const num = parseInt(arg);
        return numberIsValid(num, argumentData, argumentName) ? num : null;
      } else if (argumentData.type === "float") {
        const num = parseFloat(arg);
        return numberIsValid(num, argumentData, argumentName) ? num : null;
      } else if (argumentData.type === "bool") {
        const bool = parseBoolean(arg);
        if (bool === null) {
          sender.sendMessage(`§cArgument '${argumentName}' is not a boolean`);
          return null;
        }
        else return bool;
      };
    });

    if (args.includes(null)) return;
    return args as (string | number | boolean | undefined)[];
  };
};

world.beforeEvents.chatSend.subscribe(event => {
  const { message, sender } = event;
  const argv = parseArgv(message);
  // remove command, only keep arguments
  const command = argv.shift();
  const availableCommands = [...commands].filter(([, cmd]) => cmd.permission ? sender.isOp() : true);

  if (!command) return;

  if (availableCommands.map(([k]) => k).includes(command)) {
    const commandData = commands.get(command);
    if (!commandData) throw new Error("Command '" + command + "' data not found");

    event.cancel = true;
    const validArgv = validateCommand(argv, commandData, event.sender);

    if (validArgv) {
      commandData.callback(new CommandResponse(event.sender, commandData, validArgv));
    }
  };
});

class ChatCommandBuilder<T extends Record<string, CommandArgumentData>> {
  #name = "";
  #description = "";
  #args = {} as T;
  #permission = false;

  constructor (options?: Omit<CommandData<T>, "callback">) {
    if (!options) return;
    this.#name = options.name;
    this.#description = options.description;
    this.#args = options.args;
    this.#permission = options.permission;
  };

  withArgument<K extends keyof T, U extends CommandArgumentData>(name: K, arg: U & BaseCommandArgumentData): this {
    this.#args = Object.assign(this.#args, { [name]: arg });
    return this;
  }

  withArguments(args: T): this {
    this.#args = args as T;
    return this;
  }

  withName(name: string): this {
    this.#name = name;
    return this;
  }

  withDescription(description: string): this {
    this.#description = description;
    return this;
  }

  withPermission(permission: boolean): this {
    this.#permission = permission;
    return this;
  }

  build(): Omit<CommandData<T>, "callback"> {
    return {
      name: this.#name,
      description: this.#description,
      args: this.#args,
      permission: this.#permission,
    };
  }
}

export { registerChatCommand, CommandData, CommandResponse, CommandArgumentString, CommandArgumentNumber, CommandArgumentBool, ChatCommandBuilder };
