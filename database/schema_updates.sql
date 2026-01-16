
-- Create stories table
CREATE TABLE IF NOT EXISTS `stories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(50) DEFAULT 'General',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create animals table
CREATE TABLE IF NOT EXISTS `animals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `emoji` varchar(50) NOT NULL, -- Storing emoji as string
  `sound_file` varchar(255) DEFAULT NULL, -- Path to sound file if we have it
  `type` varchar(50) DEFAULT 'Animal', -- Animal, Bird, etc.
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample Stories
INSERT INTO `stories` (`title`, `content`, `category`) VALUES
('The Lion and the Mouse', 'Once when a Lion was asleep a little Mouse began running up and down upon him; this soon wakened the Lion, who placed his huge paw upon him, and opened his big jaws to swallow him. "Pardon, O King," cried the little Mouse: "forgive me this time, I shall never forget it: who knows but what I may be able to do you a turn some of these days?" The Lion was so tickled at the idea of the Mouse being able to help him, that he lifted up his paw and let him go. Some time after the Lion was caught in a trap, and the hunters who desired to carry him alive to the King, tied him to a tree while they went in search of a wagon to carry him on. Just then the little Mouse happened to pass by, and seeing the sad plight in which the Lion was, went up to him and soon gnawed away the ropes that bound the King of the Beasts. "Was I not right?" said the little Mouse.', 'Fable'),
('The Thirsty Crow', 'A Crow was very thirsty and wanted to drink. He flew all over the fields looking for water. For a long time, he could not find any. He felt very weak, almost lost all hope. Suddenly, he saw a water pot below the tree. He flew straight down to see if there was any water inside. Yes, he could see some water inside the pot! The Crow tried to push his head into the pot. Sadly, he found that the neck of the pot was too narrow. Then he tried to push the pot to tilt for the water to flow out, but the pot was too heavy. The Crow thought hard for a while. Then, looking around it, he saw some pebbles. He suddenly had a good idea. He started picking up the pebbles one by one, dropping each into the pot. As more and more pebbles filled the pot, the water level kept rising. Soon it was high enough for the Crow to drink. His plan had worked!', 'Fable'),
('The Tortoise and the Hare', 'The Hare was once boasting of his speed before the other animals. "I have never yet been beaten," said he, "when I put forth my full speed. I challenge any one here to race with me." The Tortoise said quietly, "I accept your challenge." "That is a good joke," said the Hare; "I could dance round you all the way." "Keep your boasting till you have beaten," answered the Tortoise. "Shall we race?" So a course was fixed and a start was made. The Hare darted almost out of sight at once, but soon stopped and, to show his contempt for the Tortoise, lay down to have a nap. The Tortoise plodded on and plodded on, and when the Hare awoke from his nap, he saw the Tortoise just near the winning-post and could not run up in time to save the race.', 'Fable'),
('The Boy Who Cried Wolf', 'A shepherd-boy, who watched a flock of sheep near a village, brought out the villagers three or four times by crying out, "Wolf! Wolf!" and when his neighbors came to help him, laughed at them for their pains. The Wolf, however, did truly come at last. The Shepherd-boy, now really alarmed, shouted in an agony of terror: "Pray, do come and help me; the Wolf is killing the sheep"; but no one paid any heed to his cries, nor rendered any assistance. The Wolf, having no cause of fear, at his leisure lacerated or destroyed the whole flock.', 'Fable');

-- Insert sample Animals
INSERT INTO `animals` (`name`, `description`, `emoji`, `type`) VALUES
('Lion', 'The Lion is known as the king of the jungle. It has a loud roar!', '🦁', 'Animal'),
('Elephant', 'The Elephant is the largest land animal. It has a long trunk and big ears.', '🐘', 'Animal'),
('Dog', 'Dogs are loyal pets and love to play fetch.', '🐶', 'Animal'),
('Cat', 'Cats are independent animals that love to chase lasers.', '🐱', 'Animal'),
('Parrot', 'Parrots are colorful birds that can mimic human speech.', '🦜', 'Bird'),
('Peacock', 'The Peacock is known for its beautiful colorful feathers.', '🦚', 'Bird'),
('Owl', 'Owls are nocturnal birds that can turn their heads almost all the way around.', '🦉', 'Bird'),
('Frog', 'Frogs are amphibians that can jump very high.', '🐸', 'Animal'),
('Tiger', 'Tigers are large wild cats with orange fur and black stripes.', '🐯', 'Animal'),
('Penguin', 'Penguins are flightless birds that live in cold places and are great swimmers.', '🐧', 'Bird');
